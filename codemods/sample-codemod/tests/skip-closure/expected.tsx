import React, { useState } from "react";

function Outer() {
	const [count, setCount] = useState(0);
	// codemod: closure-dependent — hoist manually and pass outer vars as props
	const Inner = () => <div>{count}</div>;
	return <Inner />;
}
