import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const BlogSchema = new mongoose.Schema(
  {
    title: String,
    slug: String,
    excerpt: String,
    content: String,
    author: String,
    tags: [String],
    thumbnail: String,
    published: Boolean,
    publishedAt: Date,
  },
  { timestamps: true }
);

const CourseSchema = new mongoose.Schema(
  {
    slug: String,
    title: String,
    description: String,
    difficulty: String,
    category: String,
    tags: [String],
    thumbnail: String,
    isPro: Boolean,
    modules: [mongoose.Schema.Types.Mixed],
    totalLessons: Number,
    totalDuration: Number,
  },
  { timestamps: true }
);

const initialBlogs = [
  {
    title: 'Top 5 Open Source Tools for Application Security in 2026',
    slug: 'top-5-open-source-appsec-tools-2026',
    excerpt:
      'Application security is evolving quickly. This guide covers five open-source tools you can plug into your pipeline today.',
    content: `Application security is no longer optional for modern teams.

This guide highlights practical open-source tools that can be combined in CI/CD workflows:

1. Semgrep for rule-driven static analysis.
2. OWASP ZAP for dynamic web scanning.
3. Trivy for vulnerability and misconfiguration scanning.
4. Nuclei for template-based security checks.
5. KICS for infrastructure-as-code security.

A layered approach with automation helps teams catch issues earlier and reduce deployment risk.`,
    author: 'CyberKit Team',
    tags: ['AppSec', 'Tools', 'Open Source', 'CI/CD'],
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80',
    published: true,
    publishedAt: new Date(),
  },
  {
    title: 'How to Build a Practical Password Policy That Users Follow',
    slug: 'practical-password-policy-playbook',
    excerpt:
      'Strong password policy is not just complexity rules. Learn what actually reduces account takeover risk in real teams.',
    content: `Most password policies fail because they optimize for compliance, not behavior.

Key practices:
- Use long passphrases and encourage password managers.
- Block common breached passwords.
- Require MFA for privileged and remote access.
- Monitor suspicious login patterns and impossible travel.

Security works best when users can realistically follow the policy.`,
    author: 'Blue Team Desk',
    tags: ['Identity', 'Passwords', 'MFA'],
    thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&q=80',
    published: true,
    publishedAt: new Date(Date.now() - 86400000),
  },
  {
    title: 'Phishing Red Flags: A Quick Analyst Checklist',
    slug: 'phishing-red-flags-analyst-checklist',
    excerpt:
      'A concise checklist for spotting phishing attempts across URLs, sender identity, language patterns, and attachments.',
    content: `Phishing campaigns evolve constantly, but common traits still appear:

- Urgent language that pressures immediate action.
- Mismatched sender display name and real domain.
- Suspicious links or shortened URLs.
- Unexpected attachments requesting macro execution.

Use a checklist and layered controls: secure email gateway, awareness training, and reporting workflows.`,
    author: 'SOC Notes',
    tags: ['Phishing', 'Awareness', 'Email Security'],
    thumbnail: 'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&q=80',
    published: true,
    publishedAt: new Date(Date.now() - 2 * 86400000),
  },
];

const initialCourses = [
  {
    slug: 'intro-to-web-hacking',
    title: 'Introduction to Web Hacking',
    description:
      'Learn web fundamentals and attack paths including XSS and SQL injection with defensive guidance.',
    difficulty: 'beginner',
    category: 'Web Security',
    tags: ['OWASP', 'XSS', 'SQLi'],
    thumbnail: 'https://images.unsplash.com/photo-1510511459019-5efa325f6fa?auto=format&fit=crop&q=80',
    isPro: false,
    totalLessons: 4,
    totalDuration: 6,
    modules: [],
  },
  {
    slug: 'phishing-defense-foundations',
    title: 'Phishing Defense Foundations',
    description:
      'Build practical skills for identifying, triaging, and reporting phishing attempts in enterprise environments.',
    difficulty: 'beginner',
    category: 'Security Operations',
    tags: ['Phishing', 'SOC', 'Email Security'],
    thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80',
    isPro: false,
    totalLessons: 3,
    totalDuration: 4,
    modules: [],
  },
  {
    slug: 'cryptography-primer-for-security-engineers',
    title: 'Cryptography Primer for Security Engineers',
    description:
      'Understand hashing, encryption, and key exchange to make better implementation and review decisions.',
    difficulty: 'intermediate',
    category: 'Cryptography',
    tags: ['Hashing', 'Encryption', 'PKI'],
    thumbnail: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80',
    isPro: false,
    totalLessons: 4,
    totalDuration: 7,
    modules: [],
  },
];

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

    console.log('Upserting initial blogs...');
    for (const blog of initialBlogs) {
      await Blog.findOneAndUpdate({ slug: blog.slug }, blog, { upsert: true, new: true, setDefaultsOnInsert: true });
    }

    console.log('Upserting initial courses...');
    for (const course of initialCourses) {
      await Course.findOneAndUpdate(
        { slug: course.slug },
        course,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    console.log('Initial content seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
