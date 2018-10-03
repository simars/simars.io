import React from 'react'
import Link from 'gatsby-link'

const BlogPage = ({ data }) => (
  <div>
    <h1>Programming, Architecture, Concepts & Trends</h1>
    <p>Also on <a href='https://medium.com/simars' target='_blank'>[Medium]</a></p>

    {data.allMarkdownRemark.edges.map(post => (
      <div key={post.node.id}>
        <h3><Link to={post.node.frontmatter.path}>{post.node.frontmatter.title}</Link></h3>
        <small>
          Posted by {post.node.frontmatter.author} on{' '}
          {post.node.frontmatter.date}
        </small>
        <br />
        {/*<Link to={post.node.frontmatter.path}>Read More</Link>*/}
        <br />
        <hr />
      </div>
    ))}
  </div>
)

export const pageQuery = graphql`
  query BlogIndexQuery {
    allMarkdownRemark {
      edges {
        node {
          id
          frontmatter {
            path
            title
            date
            author
          }
        }
      }
    }
  }
`

export default BlogPage
