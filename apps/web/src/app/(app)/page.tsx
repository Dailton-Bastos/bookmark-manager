import { SortByDropdown } from '@/components/app/sort-by-dropdown'
import { SectionCards } from './_components/section-cards'

const mockBookmarks = [
	{
		id: 'bm-001',
		title: 'GitHub',
		url: 'https://github.com',
		favicon: '/images/favicon-github.png',
		description:
			'Where the world builds software. Millions of developers and companies build, ship, and maintain their software on GitHub.',
		tags: ['Tools', 'Community', 'Git'],
		pinned: false,
		isArchived: false,
		visitCount: 198,
		createdAt: '2024-01-05T06:00:00Z',
		lastVisited: '2025-09-24T15:30:00Z'
	},
	{
		id: 'bm-002',
		title: 'Stack Overflow',
		url: 'https://stackoverflow.com',
		favicon: '/images/favicon-stack-overflow.png',
		description:
			'The largest, most trusted online community for developers to learn, share their knowledge, and build their careers.',
		tags: ['Community', 'Reference', 'Tips'],
		pinned: false,
		isArchived: false,
		visitCount: 234,
		createdAt: '2024-01-08T07:30:00Z',
		lastVisited: '2025-09-24T11:00:00Z'
	},
	{
		id: 'bm-003',
		title: 'MDN Web Docs',
		url: 'https://developer.mozilla.org',
		favicon: '/images/favicon-mdn.png',
		description:
			'The MDN Web Docs site provides information about Open Web technologies including HTML, CSS, and APIs for both Web sites and progressive web apps.',
		tags: ['Reference', 'HTML', 'CSS', 'JavaScript'],
		pinned: true,
		isArchived: false,
		visitCount: 152,
		createdAt: '2024-01-10T08:15:00Z',
		lastVisited: '2025-09-24T09:20:00Z'
	},
	{
		id: 'bm-004',
		title: 'CSS-Tricks',
		url: 'https://css-tricks.com',
		favicon: '/images/favicon-css-tricks.png',
		description:
			'Daily articles about CSS, HTML, JavaScript, and all things related to web design and development.',
		tags: ['CSS', 'Tutorial', 'Tips'],
		pinned: false,
		isArchived: false,
		visitCount: 89,
		createdAt: '2024-01-12T11:45:00Z',
		lastVisited: '2025-09-22T16:30:00Z'
	},
	{
		id: 'bm-005',
		title: 'Frontend Mentor',
		url: 'https://www.frontendmentor.io',
		favicon: '/images/favicon-frontend-mentor.png',
		description:
			'Improve your front-end coding skills by building real projects. Solve real-world HTML, CSS and JavaScript challenges whilst working to professional designs.',
		tags: ['Practice', 'Learning', 'Community'],
		pinned: true,
		isArchived: false,
		visitCount: 47,
		createdAt: '2024-01-15T10:30:00Z',
		lastVisited: '2025-09-23T14:45:00Z'
	},
	{
		id: 'bm-006',
		title: 'Smashing Magazine',
		url: 'https://www.smashingmagazine.com',
		favicon: '/images/favicon-smashing-magazine.png',
		description:
			'For web designers and developers. Articles on CSS, JavaScript, front-end, UX, design systems, and more.',
		tags: ['Design', 'Tutorial', 'Performance'],
		pinned: false,
		isArchived: false,
		visitCount: 23,
		createdAt: '2024-01-18T13:20:00Z',
		lastVisited: '2025-09-10T11:15:00Z'
	},
	{
		id: 'bm-007',
		title: 'Can I Use',
		url: 'https://caniuse.com',
		favicon: '/images/favicon-caniuse.png',
		description:
			'Support tables for HTML5, CSS3, etc. Check browser compatibility for web technologies.',
		tags: ['Tools', 'Reference', 'Compatibility'],
		pinned: false,
		isArchived: false,
		visitCount: 67,
		createdAt: '2024-01-20T14:15:00Z',
		lastVisited: '2025-09-20T10:00:00Z'
	},
	{
		id: 'bm-008',
		title: 'CodePen',
		url: 'https://codepen.io',
		favicon: '/images/favicon-codepen.png',
		description:
			'An online code editor and social development environment for front-end designers and developers.',
		tags: ['Tools', 'Practice', 'Community'],
		pinned: false,
		isArchived: false,
		visitCount: 34,
		createdAt: '2024-01-25T16:45:00Z',
		lastVisited: '2025-09-18T17:30:00Z'
	},
	{
		id: 'bm-009',
		title: 'CSS Grid Garden',
		url: 'https://cssgridgarden.com',
		favicon: '/images/favicon-css-grid-garden.png',
		description:
			'A game for learning CSS grid layout. Grow your carrot garden by writing CSS grid code.',
		tags: ['CSS', 'Practice', 'Layout'],
		pinned: false,
		isArchived: false,
		visitCount: 8,
		createdAt: '2024-02-01T09:00:00Z',
		lastVisited: '2025-07-15T15:45:00Z'
	},
	{
		id: 'bm-010',
		title: 'Flexbox Froggy',
		url: 'https://flexboxfroggy.com',
		favicon: '/images/favicon-flexbox-froggy.png',
		description:
			'A game where you help Froggy and friends by writing CSS flexbox code.',
		tags: ['CSS', 'Practice', 'Layout'],
		pinned: false,
		isArchived: true,
		visitCount: 12,
		createdAt: '2024-02-01T09:30:00Z',
		lastVisited: '2025-06-12T14:20:00Z'
	},
	{
		id: 'bm-011',
		title: 'freeCodeCamp',
		url: 'https://www.freecodecamp.org',
		favicon: '/images/favicon-freecodecamp.png',
		description:
			'Learn to code for free. Build projects. Earn certifications. An open source community that helps you learn to code with free online courses and certifications.',
		tags: ['Learning', 'Practice', 'Community'],
		pinned: false,
		isArchived: false,
		visitCount: 28,
		createdAt: '2024-02-05T10:20:00Z',
		lastVisited: '2025-08-30T13:40:00Z'
	},
	{
		id: 'bm-012',
		title: 'JavaScript.info',
		url: 'https://javascript.info',
		favicon: '/images/favicon-javascript-info.png',
		description:
			"The Modern JavaScript Tutorial. How it's done now. From the basics to advanced topics with simple, but detailed explanations.",
		tags: ['JavaScript', 'Tutorial', 'Learning'],
		pinned: false,
		isArchived: false,
		visitCount: 41,
		createdAt: '2024-02-08T11:30:00Z',
		lastVisited: '2025-09-15T09:15:00Z'
	},
	{
		id: 'bm-013',
		title: 'Dev.to',
		url: 'https://dev.to',
		favicon: '/images/favicon-dev.png',
		description:
			'A constructive and inclusive social network for software developers. Share knowledge and grow your career.',
		tags: ['Community', 'Learning', 'Tips'],
		pinned: false,
		isArchived: false,
		visitCount: 19,
		createdAt: '2024-02-10T15:00:00Z',
		lastVisited: '2025-09-21T08:45:00Z'
	},
	{
		id: 'bm-014',
		title: 'Tailwind CSS',
		url: 'https://tailwindcss.com',
		favicon: '/images/favicon-tailwind.png',
		description:
			'A utility-first CSS framework for rapidly building modern websites without ever leaving your HTML.',
		tags: ['CSS', 'Framework', 'Tools'],
		pinned: false,
		isArchived: false,
		visitCount: 52,
		createdAt: '2024-02-12T09:45:00Z',
		lastVisited: '2025-09-19T16:10:00Z'
	},
	{
		id: 'bm-015',
		title: 'Web.dev',
		url: 'https://web.dev',
		favicon: '/images/favicon-web-dev.png',
		description:
			'Guidance to build modern web experiences that work on any browser. Learn about web vitals, PWAs, and more.',
		tags: ['Performance', 'Learning', 'Tips'],
		pinned: false,
		isArchived: false,
		visitCount: 15,
		createdAt: '2024-02-15T12:20:00Z',
		lastVisited: '2025-08-16T14:55:00Z'
	},
	{
		id: 'bm-016',
		title: 'Claude',
		url: 'https://claude.ai',
		favicon: '/images/favicon-claude.png',
		description:
			'An AI assistant created by Anthropic that can help with analysis, writing, coding, math, and creative tasks through natural conversation.',
		tags: ['Tools', 'AI', 'Learning'],
		pinned: false,
		isArchived: false,
		visitCount: 73,
		createdAt: '2024-02-18T10:15:00Z',
		lastVisited: '2025-09-23T11:20:00Z'
	},
	{
		id: 'bm-017',
		title: 'React Docs',
		url: 'https://react.dev',
		favicon: '/images/favicon-react-docs.png',
		description:
			'The library for web and native user interfaces. Build user interfaces out of individual pieces called components.',
		tags: ['JavaScript', 'Framework', 'Reference'],
		pinned: false,
		isArchived: false,
		visitCount: 0,
		createdAt: '2024-02-20T14:30:00Z',
		lastVisited: null
	},
	{
		id: 'bm-018',
		title: 'Flexbox Zombies',
		url: 'https://mastery.games/flexboxzombies',
		favicon: '/images/favicon-flexbox-zombies.png',
		description:
			'Master flexbox layout in CSS by playing a survival game. Use flexbox to position your crossbow and survive the zombie apocalypse.',
		tags: ['CSS', 'Practice', 'Layout'],
		pinned: false,
		isArchived: true,
		visitCount: 6,
		createdAt: '2024-02-22T08:50:00Z',
		lastVisited: '2025-04-18T15:30:00Z'
	}
]

const Home = () => {
	return (
		<div className="w-full p-8">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-foreground">All bookmarks</h1>
				<div className="ml-auto flex items-center gap-4">
					<SortByDropdown />
				</div>
			</div>

			<div className="flex flex-1 flex-col">
				<div className="@container/main flex flex-1 flex-col gap-2">
					<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
						<SectionCards bookmarks={mockBookmarks} />
					</div>
				</div>
			</div>
		</div>
	)
}

export default Home
