export interface IBuilder<T> {
	build: () => T;
	isBuildable: () => boolean;
}
