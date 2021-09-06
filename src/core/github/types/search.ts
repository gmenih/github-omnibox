export interface Owner {
    login: string;
}

export interface Edge<TNode> {
    node: TNode;
}

export interface Search<TNode> {
    edges: Edge<TNode>[];
}

export interface SearchResponse<TNode> {
    search: Search<TNode>;
}
