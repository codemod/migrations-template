import React, { useState } from "react";

function Outer() {
	const [count, setCount] = useState(0);
	const Inner = () => <div>{count}</div>;
	return <Inner />;
}
