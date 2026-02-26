import React from "react";

function NestedCard() {
	return <div>Card content</div>;
}

function Outer() {
	return <NestedCard />;
}
