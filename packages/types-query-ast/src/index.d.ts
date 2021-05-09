declare module 'query-ast' {
  export type ValueType = 'operator' | 'space' | 'number' | 'color_hex' | 'identifier' | 'atkeyword' | 'string_double'  | 'string_single' | 'punctuation';

  export type JSONNodeValue<T extends string = string, U extends object = Node> = string | Node<T, U>[];

  export type JSONNode<T extends string = string, U extends object = Node> = U & {
    type: T
    value: string | JSONNode<T, U>[]
  };

  export type NewJSONNodeValue<T extends string = string, U extends object = NewJSONNode> = string | NewJSONNode<T, U>[];

  export type NewJSONNode<T extends string = string, U extends object = {}> = U & {
    type: T
    value: string | NewJSONNode<T, U>[]
  };

  export type NodeValue<T extends string = string, U extends object = Node> = string | Node<T, U>[];

   export type Node<T extends string = string, U extends object = {}> = U & {
    readonly type: T
    readonly value: NodeValue<T, U>
  };

  interface NodeWrapperBase<T extends string, U extends object = Node> {
    new (node: JSONNode<T, U>, parent?: NodeWrapper<T, U>): NodeWrapper<T, U>;
    create(node: NodeWrapper<T, U> | Node<T, U>, parent?: NodeWrapper<T, U>): NodeWrapper<T, U>
    isNodeWrapper(maybeNode: any): false | NodeWrapper<T, U>
    readonly node: Node<T, U>
    readonly parent?: NodeWrapper<T, U>
    reduce<V>(reduceFn: ReduceFn<T, V, U>, acc?: V): V
    toJSON(): JSONNode<T, U>;
  }

  interface HasChildrenNodeWrapper<T extends string, U extends object = Node> extends NodeWrapperBase<T, U> {
    readonly hasChildren: true
    readonly children: NodeWrapper<T, U>[]
  }

  interface NoChildrenNodeWrapper<T extends string, U extends object = Node> extends NodeWrapperBase<T, U> {
    readonly hasChildren: false
    readonly children: null
  }

  export type NodeWrapper<T extends string = string, U extends object = Node> = HasChildrenNodeWrapper<T, U> | NoChildrenNodeWrapper<T, U>;

  interface SelectorFn<T extends string, U extends object = Node> {
    (node: NodeWrapper<T, U>): boolean
  }

  interface ReplaceFn<T extends string, U extends object = Node> {
    (node: NodeWrapper<T, U> | JSONNode<T, U>): NodeWrapper<T, U> | Node<T, U>
  }

  interface MapFn<T extends string, U, V extends object = Node> {
    (node: NodeWrapper<T, V>, index: number, array: NodeWrapper<T, V>[]): U
  }

  interface ReduceFn<T extends string, U, V extends object = Node> {
    (previousValue: U, currentValue: NodeWrapper<T, V>, currentIndex: number, array: NodeWrapper<T, V>[]): U
  }

  type Selector<T extends string, U extends object = Node> = SelectorFn<T, U> | T;

  // All methods will be applied to each node within the QueryWrapper
  export interface QueryWrapper<T extends string = string, U extends object = Node> {
    // Insert the provided  node after each node.
    after(node: Node<T, U>): this
    // Insert the provided node before each node.
    before(node: Node<T, U>): this
    // Return all children of all nodes in QueryWrapper, filtered by an optional selector.
    children<V extends string>(selector?: Selector<T, U>): QueryWrapper<V extends ValueType ? ValueType : T,U>
    // Return the first node that matches the selector, including the node itself.
    closest(selector?: Selector<T, U>): this
    // Combine the nodes of two QueryWrappers.
    concat(wrapper: QueryWrapper<T, U>): this
    // Return the node of a given index.
    eq(index: number): this
    // Filter nodes by a given selector.
    filter(selector?: Selector<T, U>): this
    // Find any child nodes that passes selector.
    find(selector?: Selector<T, U>): this
    // Return the first node in the QueryWrapper
    first(): this
    // Return the QueryWrapper in JSON format, as an array if no index is provided.
    get<V extends number>(index: V): JSONNode<T, U>;
    get(): JSONNode<T, U>[];
     // Reduce the nodes that have a child that satisfies the given selector.
    has(selector?: Selector<T, U>): this
    // Reduce the nodes that have a parent that satisfies the given selector.
    hasParent(selector?: Selector<T, U>): this
    // Reduce the nodes that have an ancestor that satisfies the given selector.
    hasParents(selector?: Selector<T, U>): this
    // Search for a node.
    // If no argument is passed, it will return the index in relation to its siblings.
    // If a NodeWrapper is passed, it will return the index relative to the QueryWrapper.
    // If a Selector is passed, it will return the index relative to the first node in the QueryWrapper.
    index(nodeSelector?: NodeWrapper<T, U> | Selector<T, U>): number
    // Return the last node in the QueryWrapper.
    last(): this
    // Return the number of nodes in the QueryWrapper.
    length(): number
    // Map the set of nodes in the QueryWrapper.
    map<V>(fn: MapFn<T, V, U>): V[]
    // Return the next sibling of each node the satisfies the given selector.
    next(selector?: Selector<T, U>): this
    // Return the the following siblings of each node the satisfies the given selector.
    nextAll(selector?: Selector<T, U>): this
    // Return the parent of each node in that satisfies the given selector.
    parent(selector?: Selector<T, U>): this
    // Return the ancestor of each node in that satisfies the given selector.
    parents<V extends string>(selector?: Selector<V, U>): QueryWrapper<V extends T ? T : V, U>
    // parents<V extends string>(selector?: Selector<V, U>): QueryWrapper<V, U>
    // Return the ancestors of each node up to, but not including, that satisfies the given selector.
    parentsUntil(selector?: Selector<T, U>): this
    // Return the previous sibling of each node the satisfies the given selector.
    prev(selector?: Selector<T, U>): this
    // Return the the preceding siblings of each node the satisfies the given selector.
    prevAll(selector?: Selector<T, U>): this
    // Reduce the set of nodes in the QueryWrapper.
    reduce<V>(reduceFn: ReduceFn<T, V, U>, acc?: V): V
    // Remove the set of nodes.
    remove(): this
    // Replace each node in the set of nodes.
    replace(replaceFn: ReplaceFn<T, U>): this
    // Get the combined value of the QueryWrapper, including descendants.
    value(): string
  }

  // Modify the logic that is standard for the library
  interface QueryOptions<T extends string, U extends object = Node> {
    getChildren?(node: Node<T, U>): Node<T, U>[]
    getType?(node: Node<T, U>): string
    hasChildren?(node: Node<T, U>): boolean
    toJSON?(node: Node<T, U>, children?: Node<T, U>): boolean
    toString?(node: Node<T, U>): string
  }

  // Build a QueryWrapper from the return value of a query.
  export interface CreateQueryWrapper <T extends string, U extends object = Node>{
    (): QueryWrapper<T, U>
  }

  function query<T extends string = string, U extends object = Node>(node: JSONNode<T, U>, options?: QueryOptions<T, U>): CreateQueryWrapper<T, U>;

  export default query;
}
