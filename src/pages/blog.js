import React from 'react'
import Link from 'gatsby-link'

const BlogPage = ({ data }) => (
  <section>

    <div className="column">
      <span>Also on <a href='https://medium.com/simars' target='_blank'>[Medium]</a></span>
      <h2>Programming, Architecture, Concepts & Trends</h2>
    </div>

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
  </section>
)

export const pageQuery = graphql`
  query BlogIndexQuery {
    allMarkdownRemark(
      sort: { 
        fields: [frontmatter___date], order: DESC 
       }
      filter: { 
        frontmatter: { published: { eq: true } } } 
    ) {
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
