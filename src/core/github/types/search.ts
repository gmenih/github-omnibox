export interface Owner {
    login: string;
}

export interface Node {
    name: string;
    url: string;
    owner: Owner;
}

export interface Edge {
    node: Node;
}

export interface Search {
    edges: Edge[];
}

export interface SearchResponse {
    search: Search;
}
