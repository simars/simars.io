---
path: "/deadlocks-how-to-avoid-them-in-real-world-concurrency"
date: "2019-04-10"
title: "Deadlocks & Livelocks — How to avoid in real world Concurrency?"
author: "Simar Paul Singh"
published: true
---

**Deadlocks** can occur only in Concurrent (multi-threaded) programs where threads synchronize (use locks) access to one or more shared resources (variables and object) or instruction-set (critical-section).

**Livelocks** occur when we try to avoid deadlocks using asynchronous locking, where multiple threads competing for the same set lock(s), avoid acquiring the lock(s) to allow other threads to go with the lock first, and eventually never get to acquire a lock and proceed; causing starvation. See below to understand how a **_aysnc-locking which is a strategy to avoid Deadlock can be the reason for a Livelock_**

Here are some of the **theoretical solutions** to **Deadlocks**, and one them (second one) is the main **reason** for **Livelocks**

### Theoretical Approaches

#### Don’t use locks

Not possible where two operations need to be synchronized, example, a simple bank transfer, where you debit one account before you can credit the other account, and not let any other thread touch the balance in accounts until the current thread is done.

#### Don’t block on locks, if a thread can’t acquire a lock, it should release previously acquired locks to try again later

Cumbersome to implement and can cause starvation (**Livelocks**) where a thread is always letting locks go only to try again and do the same. Also, this approach may have over-heads in frequent thread context switching reducing a system’s overall performance. Also, there is no way for CPU scheduler implement fairness as it doesn’t know which thread has been actually waiting for lock(s) the longest.

#### Let threads always request locks in a strict ordering

Easier said than done, for example. If we are writing a function to transfer money from Account A to B, we can write something like

```
// at compile time, we take lock on first arg then second  
public void transfer(Account A, Account B, long money) {  
  synchronized (A) {  
    synchronized (B) {  
      A.add(amount);  
      B.subtract(amount);  
    }  
  }  
}

// at runtime we cannot track how our methods will be called  
public void run() {  
  new Thread(()->this.transfer(X,Y, 10000)).start();  
  new Thread(()->this.transfer(Y,X, 10000)).start();  
}  
// this run() will create a deadlock  
// first thread locks on X, waits for Y  
// second thread locks on Y, waits for X
```

### Real world solution

We can combine approaches of lock ordering and timed locks to arrive at a real word solution

#### Business Determined Lock Ordering

We can improve our approach by discriminating between A and B based on whose account number is greater or smaller.

```
// at run time, we take lock on account with smaller id first  
public void transfer(Account A, Account B, long money) {  
  final Account first = A.id < B.id ? A : B;  
  final Account second = first == A? B: A;

  synchronized (first) {  
    synchronized (second) {  
      first.add(amount);  
      second.subtract(amount);  
    }  
  }  
}

// at runtime we cannot track how our methods will be called  
public void run() {  
  new Thread(()->this.transfer(X,Y, 10000)).start();  
  new Thread(()->this.transfer(Y,X, 10000)).start();  
}
```

For example, if `X.id = 1111`, and `Y.id = 2222`, since we take in first account as the one with smaller account id, the locking order for executions of `transfer(Y, X, 10000)` and `transfer(X,Y, 10000)` will be same. X having an account number lesser than Y, both threads will attempt to lock X before Y and only one of them will succeed and proceed to lock Y finish and release locks on X and Y before the other threads acquires locks and can proceed.

#### Business Determined Timed Wait tryLock / async Locking Requests

The solution of using a business determined lock ordering works only if for associative relationships where a logic at one place transfer(….), such as in our method determines how resources are coordinated.

We may end up have other methods / logic, which ends up using an ordering logic that is incompatible with `transfer(…)`. To avoid **Deadlock** in such cases, it is advisable to use async locking, where we try to lock a resource for finite / realistic time (max transaction time) + Small-random-wait-time so all threads don’t try ti re-acquire too early and not all at the same time respectively hence avoiding **Livelocks** (starvation due to unviable attempts at acquiring locks)

```
// assume Account#getLock() gives us account's Lock  (java.util.concurrent.locks.Lock)  
// Account could encapsulate lock, provide lock() /unlock()

public long getWait() {   
/// returns moving average of transfer times for last n transfers + small-random-salt in millis so all threads waiting to lock do not wake up at the same time.  
}

public void transfer(Lock lockF, Lock lockS, int amount) {  
  final Account first = A.id < B.id ? A : B;  
  final Account second = first == A? B: A;  
  final Lock lockF = first.getLock();  
  final Lock lockS = second.getLock();

  boolean done = false;

  do {  
    try {  
      try {  
        if (lockF.tryLock(getWait(), _MILLISECONDS_)) {  
          try {  
            if (lockS.tryLock(getWait(), _MILLISECONDS_)) {  
              done = true;  
            }  
          } finally {  
            lockS.unlock();  
          }  
        }  
      } catch (InterruptedException e) {  
        throw new RuntimeException("Cancelled");  
      }  
    } finally {  
      lockF.unlock();  
    }  
  } while (!done);  

}

// at runtime we cannot track how our methods will be called  
public void run() {  
    new Thread(()->this.transfer(X,Y, 10000)).start();  
    new Thread(()->this.transfer(Y,X, 10000)).start();  
}
```

--------

This article is also aviable on my [**Medium**][Medium] publication. If you like the artile, or have any comments and suggestions, please **_clap_** or leave **_comments_** on [**Medium**][Medium].

[Medium]:https://medium.com/simars/deadlocks-how-to-avoid-them-in-real-world-con-3fa8662ed6d4?source=friends_link&sk=8755ba0f19a9cfd9ed5e709a4c5b9d2d
