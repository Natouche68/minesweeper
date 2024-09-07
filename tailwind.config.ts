import type { Config } from "tailwindcss";
import catppuccin from "@catppuccin/tailwindcss";

export default {
	content: ["./src/**/*.{html,js,svelte,ts}"],

	theme: {
		colors: {},
	},

	plugins: [
		catppuccin({
			defaultFlavour: "macchiato",
		}),
	],
} as Config;
