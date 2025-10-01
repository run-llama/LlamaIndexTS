// @ts-check
import { defineConfig, passthroughImageService } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import AutoImport from 'astro-auto-import';
import starlightAutoSidebar from 'starlight-auto-sidebar'
import path from 'path';

// https://astro.build/config
export default defineConfig({
	site: "https://developers.llamaindex.ai",
	base: "/typescript/",
	outDir: path.resolve('../dist/typescript/'),
	integrations: [
		starlight({
			plugins: [starlightAutoSidebar()],
			title: 'LlamaIndex Documentation',
			head: [
				{
					tag: 'script',
					content: `
					(function (w, d, s, l, i) {
					  w[l] = w[l] || [];
					  w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
					  var f = d.getElementsByTagName(s)[0],
						j = d.createElement(s),
						dl = l != "dataLayer" ? "&l=" + l : "";
					  j.async = true;
					  j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
					  f.parentNode.insertBefore(j, f);
					})(window, document, "script", "dataLayer", "GTM-WWRFB36R");
				  `,
				},
				{
					tag: 'script',
					content: `
						document.addEventListener("DOMContentLoaded", function () {
							var script = document.createElement("script");
							script.type = "module";
							script.id = "runllm-widget-script"
							script.src = "https://widget.runllm.com";
							script.setAttribute("version", "stable");
							script.setAttribute("crossorigin", "true");
							script.setAttribute("runllm-keyboard-shortcut", "Mod+j");
							script.setAttribute("runllm-name", "LlamaIndex");
							script.setAttribute("runllm-position", "BOTTOM_RIGHT");
							script.setAttribute("runllm-assistant-id", "1450");
							script.setAttribute("runllm-disable-ask-a-person", true);
							script.setAttribute(
								"runllm-slack-community-url",
								"https://discord.com/invite/eN6D2HQ4aX"
							);
							script.async = true;
							document.head.appendChild(script);
						});
					`
				}
			],
			social: [
				{
					icon: 'twitter',
					label: 'Twitter',
					href: 'https://x.com/llama_index'
				},
				{
					icon: 'linkedin',
					label: 'LinkedIn',
					href: 'https://www.linkedin.com/company/llamaindex'
				},
				{
					icon: 'blueSky',
					label: 'Bluesky',
					href: 'https://bsky.app/profile/llamaindex.bsky.social'
				},
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/run-llama/LlamaIndexTS'
				}
			],
			logo: {
				light: './src/assets/llamaindex-dark.svg',
				dark: './src/assets/llamaindex-light.svg',
				replacesTitle: true,
			},
			favicon: '/logo-dark.png',
			components: {
				SiteTitle: './src/components/SiteTitle.astro',
				Header: './src/components/Header.astro',
			},
			sidebar: [
				{
					label: 'Framework',
					autogenerate: { directory: 'framework', collapsed: true },
				},
				{
					label: 'Framework API Reference 🔗',
					link: '/framework-api-reference/'
				},
			],
		}),
		AutoImport({
			imports: [
				{
					'@icons-pack/react-simple-icons': ['SiBun', 'SiCloudflareworkers', 'SiDeno', 'SiNodedotjs', 'SiTypescript', 'SiVite', 'SiNextdotjs', 'SiDiscord', 'SiGithub', 'SiNpm', 'SiX'],
					'@astrojs/starlight/components': ['Card', 'CardGrid', 'LinkCard', 'Icon', 'Tabs', 'TabItem', 'Aside']
				},
			],
		}),
		react(),
	],
	image: {
		service: passthroughImageService(),
	}
});
