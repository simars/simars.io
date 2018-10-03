import React from 'react'
import Link from 'gatsby-link'
import BlogPage from "./blog";

const IndexPage = ({data}) => (
  <div>
    <h1 className="row">Welcome to my portal | Simars.io</h1>
    <p>
      My name is <em>Simar Paul Singh</em>. I am polyglot programmer, experienced software developer and architect.
    </p>

    <h3 className='row'>
      <a href='https://www.linkedin.com/in/simar-singh-4930544/' target='_blank'>Linked In</a>
      <a href='https://github.com/simars' target='_blank'>GitHub</a>
      <a href='https://medium.com/simars' target='_blank'>Medium</a>
      <a href='https://codepen.io/simars' target='_blank'>CodePen</a>
      <a href='https://stackblitz.com/@simars' target='_blank'>StackBlitz</a>
    </h3>
    <hr/>
    <h2 className='row'> Recent Posts </h2>
    <BlogPage data={data}/>
    <h3 className="row">
      <span>Complete Blog <Link to="/blog">[Here]</Link> or on <a href='https://medium.com/simars' target='_blank'>[Medium]</a></span>
    </h3>

  </div>
)

export const pageQuery = graphql`
  query IndexPageQuery {
allMarkdownRemark(
      limit: 15
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

export default IndexPage
