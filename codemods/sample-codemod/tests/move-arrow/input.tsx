import React from "react";

function Outer() {
	const Inner = () => <div>Hello</div>;
	return <Inner />;
}
