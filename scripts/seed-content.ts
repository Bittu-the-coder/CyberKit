import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Setup schemas locally to bypass Next.js API restrictions in script
const BlogSchema = new mongoose.Schema({
  title: String,
  slug: String,
  excerpt: String,
  content: String,
  author: String,
  tags: [String],
  thumbnail: String,
  published: Boolean,
  publishedAt: Date,
}, { timestamps: true });

const CourseSchema = new mongoose.Schema({
  slug: String,
  title: String,
  description: String,
  difficulty: String,
  category: String,
  tags: [String],
  thumbnail: String,
  isPro: Boolean,
  modules: [
      {
          title: String,
          lessons: [
              {
                  title: String,
                  type: String,
                  content: String,
                  duration: Number,
                  xpReward: Number,
              }
          ]
      }
  ],
  totalLessons: Number,
  totalDuration: Number,
}, { timestamps: true });

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not defined in .env');
    process.exit(1);
  }

  try {
    console.log('Connecting to database...');
    await mongoose.connect(uri);
    console.log('Connected.');

    const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);
    const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);

    console.log('Clearing existing sample data...');
    await Blog.deleteMany({});
    // await Course.deleteMany({}); // Don't delete all courses just in case they have custom ones, but we can override matching slugs

    const sampleBlog = {
        title: 'Top 5 Open Source Tools for Application Security in 2026',
        slug: 'top-5-open-source-appsec-tools-2026',
        excerpt: 'Application security is evolving faster than ever. Here is a curated list of the absolute best open-source tools to add to your pipeline.',
        content: `Application security is no longer an afterthought—it's the core of modern development. As threats grow in sophistication, so must our defenses.

We've analyzed the landscape and found the top 5 open source tools you need right now.

1. **Semgrep**: A fast, open-source, static analysis engine for finding bugs, detecting dependency vulnerabilities, and enforcing code standards.
2. **OWASP ZAP**: The world's most widely used web app scanner. Free and open source.
3. **Trivy**: A comprehensive and versatile security scanner. It finds vulnerabilities, IaC misconfigurations, SBOM discovery, and secret scanning.
4. **Nuclei**: Fast and customisable vulnerability scanner based on simple YAML based DSL.
5. **KICS**: Find security vulnerabilities, compliance issues, and infrastructure misconfigurations early in the development cycle of your infrastructure-as-code.

Incorporating these into your CI/CD pipelines will drastically improve your security posture without adding significant licensing costs.

Stay secure!`,
        author: 'CyberKit Team',
        tags: ['AppSec', 'Tools', 'Open Source', 'CI/CD'],
        thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80',
        published: true,
        publishedAt: new Date()
    };

    const sampleBlog2 = {
        title: 'Understanding the New CyberKit Features',
        slug: 'understanding-cyberkit-updates',
        excerpt: 'We have massively overhauled the platform to bring you a seamless Admin experience, dynamic blogging, and much more.',
        content: `Welcome to the new and improved CyberKit.

We've been working hard to bring you the features you need most. We have wired up 12 entirely functional cybersecurity tools covering everything from Reconnaissance to Network Scanning to Web Application Analysis.

We have also launched our new **Courses** platform natively inside the application, complete with article-based lessons and interactive examples.

Enjoy the update, and happy hunting!`,
        author: 'Admin',
        tags: ['Update', 'Announcement', 'Platform'],
        thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80',
        published: true,
        publishedAt: new Date(Date.now() - 86400000) // 1 day ago
    };

    console.log('Inserting sample blogs...');
    await Blog.create([sampleBlog, sampleBlog2]);

    const sampleCourse = {
        slug: 'intro-to-web-hacking',
        title: 'Introduction to Web Hacking',
        description: 'A comprehensive guide to understanding and exploiting common web vulnerabilities like XSS, SQLi, and CSRF.',
        difficulty: 'beginner',
        category: 'Web Security',
        tags: ['OWASP', 'XSS', 'SQLi'],
        thumbnail: 'https://images.unsplash.com/photo-1510511459019-5efa325f6fa?auto=format&fit=crop&q=80',
        isPro: false,
        totalLessons: 3,
        totalDuration: 5,
        modules: [
            {
                title: 'Module 1: Fundamentals of the Web',
                lessons: [
                    {
                        title: 'How HTTP Works',
                        type: 'text',
                        content: `## The Backbone of the Web

HTTP (Hypertext Transfer Protocol) is the foundation of data communication for the World Wide Web. It functions as a request-response protocol in the client-server computing model.

**Key Concepts:**
- **Methods:** GET (retrieve data), POST (submit data), PUT (update), DELETE (remove).
- **Status Codes:** 200 (OK), 404 (Not Found), 500 (Internal Server Error).
- **Headers:** Provide metadata about the request or response (e.g., \`User-Agent\`, \`Content-Type\`, \`Set-Cookie\`).

Understanding these basics is crucial because most web vulnerabilities involve manipulating these requests and responses.`,
                        duration: 30,
                        xpReward: 50
                    },
                    {
                        title: 'Introduction to XSS',
                        type: 'text',
                        content: `## Cross-Site Scripting (XSS)

XSS is a vulnerability that occurs when a web application includes untrusted data in a web page without proper validation or escaping.

If an attacker can inject a malicious script (usually JavaScript) into a victim's browser, the script executes in the context of the victim's session.

### Types of XSS
1. **Reflected XSS:** The malicious payload is part of the request and reflected back in the immediate response (e.g., in a search query parameter).
2. **Stored XSS:** The malicious payload is saved on the server (e.g., in a database via a comment form) and then displayed to victims who view the infected page.
3. **DOM-based XSS:** The vulnerability exists in the client-side code rather than the server-side code.

*Prevention relies heavily on context-aware output encoding.*`,
                        duration: 45,
                        xpReward: 75
                    }
                ]
            },
            {
                title: 'Module 2: Database Exploitation',
                lessons: [
                    {
                        title: 'SQL Injection (SQLi) Basics',
                        type: 'text',
                        content: `## Speaking with the Database

SQL injection is a web security vulnerability that allows an attacker to interfere with the queries that an application makes to its database. It generally allows an attacker to view data that they are not normally able to retrieve.

**Classic Example:**
Consider an authentication query:
\`SELECT * FROM users WHERE username = '\$username' AND password = '\$password'\`

If the application doesn't sanitize the input, an attacker can input \`admin' --\` as the username.
The resulting query becomes:

\`SELECT * FROM users WHERE username = 'admin' --' AND password = ''\`

The \`--\` comments out the rest of the line, bypassing the password check entirely!

**Mitigation:** Always use Prepared Statements (Parameterized Queries).`,
                        duration: 60,
                        xpReward: 100
                    }
                ]
            }
        ]
    };

    console.log('Inserting sample course...');
    await Course.deleteOne({ slug: sampleCourse.slug }); // Clean up if exists
    await Course.create(sampleCourse);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
