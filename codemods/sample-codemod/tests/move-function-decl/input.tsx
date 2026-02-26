import React from "react";

function Outer() {
	function NestedCard() {
		return <div>Card content</div>;
	}
	return <NestedCard />;
}
