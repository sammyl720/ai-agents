export interface IBuilder<T> {
	build: () => T;
	isBuildable: () => boolean;
}

export interface IBuilderFactory<T> {
	getBuilder(): IBuilder<T>;
}
