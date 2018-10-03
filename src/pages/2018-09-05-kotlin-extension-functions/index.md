---
path: "/kotlin-extension-functions-make-any-class-have-what-you-wish-for"
date: "2018-09-05"
title: "Kotlin | Extension Functions, make any class have what you wish for"
author: "Simar Paul Singh"
published: true
---


* * *

**Kotlin** allows us to extend a class with new functionality at **compile-time** without having to inherit from any parent class using a **_extension functions_**.

In **Java**, only mechanizm to extend a class at **compile-time** is to extend from another known class having the functionality (non-private methods / attributes) available to the inheriting classes. There are many options extend functionality of instance by encapsulating it at **run-time**, using design patterns such as Decorator, Proxy, _instance of_ check and casting. We are not going to discuss them here.

**Kotlin** supports both _extension functions_ and _extension properties_. You can find more on these special declarations called _extensions on Kotlin’s_ official documentation [here](https://kotlinlang.org/docs/reference/extensions.html).


We will take a simple and useful example, very common class, `JsonNode` from `fasterxml.jackson.` . Transforming `JsonNode` (tree style) object, is not convenient as modifying a `Map<String, Any>`. However, `ObjectMapper` comes with built in functions to convert `JsonNode` from / to a `Map<String, Any>`. We will extend its functionality of `JsonNode` _to_ allow transforming of a `JsonNode` _instance_ by setting properties as we would do on a `Map<String, Any>` object.

Let us magically extend `JsonNode` class with two _extension functions_.

1.  `JsonNode.toMap(): MutableMap<String, Any>`, which receives an instance `JsonNode` as (_this_) and can convert the `JsonNode` tree into `Map<String, Any>` using already available `ObjectMapper` functionality.
2.  `JsonNode.transform(fn: MutableMap<String,Any>.()-> Unit) :JsonNode`, which receives an instance of `JsonNode` (_jsonNode_) as (_this_) and a Function / Unit (_fn_) as an an argument to set properties on `Map<String, Any>` as its receiver.

See the implementation below. When _jsonNode.transform(fn)_ is called, it first uses `JsonNode.toMap()` extension function previously defined to create a `Map<String, Any>` (_map_) from instance of `JsonNode` (_jsonNode_) it was called upon, and then calls the _map.fn() [_aka_. map.also(fn)]_, where (_fn_) was passed in as the unit function applying all the modifications to the (_map_) built from (_jsonNode_) and finally return the resulting `Map<String, Any>` converting it to a `JsonNode` again using the `ObjectMapper`

```
  private fun jsonNode(): JsonNode = mapper.readValue(
    StringReader("""
      {
       "name": "Simar",
       "country": "Canada"
      }
      """) // triple quoted for multi-line strings
    )

  fun JsonNode.transform(fn: MutableMap<String, Any>.() -> Unit): JsonNode =
          toMap().also(fn).let **{** _mapper_.valueToTree(_it_) **}** fun JsonNode.toMap(): MutableMap<String, Any> =
    (_mapper_.readValue(StringReader(toString())) as MutableMap<String, Any>)

  @Test
  public fun tesJsonTransformation()
  {
    val jsonNode = jsonNode();
    assertEquals("Simar", jsonNode.get("name").textValue())
    assertEquals("Canada", jsonNode.get("country").textValue())
    val newJsonNode: JsonNode = jsonNode.transfrorm(**{** set("name", "Paul")
        remove("country")
    **}**);
    assertEquals("Paul", newJsonNode.get("name").textValue())
    assertNull(newJsonNode.get("country"))
  }
}
```
