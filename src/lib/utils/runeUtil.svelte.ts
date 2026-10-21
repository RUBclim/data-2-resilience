export function debounceState<T>(getter: () => T, delay: number) {
	let value = $state();
	let timer: ReturnType<typeof setTimeout>;
	$effect(() => {
		const newValue = getter(); // read here to subscribe to it
		clearTimeout(timer);
		timer = setTimeout(() => (value = newValue), delay);
		return () => clearTimeout(timer);
	});
	return () => value;
}
