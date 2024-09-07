export type Cell = {
	content: "bomb" | number;
	state: "hidden" | "flagged" | "visible";
};
