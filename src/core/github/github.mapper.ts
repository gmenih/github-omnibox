import {GitHubOrganizationData, GithubRepository, OrganizationNode, RepositoryNode} from '.';

export function mapRepositories(nodes: RepositoryNode[], ownerName?: string): GithubRepository[] {
    return nodes.map((node) => {
        return {
            name: node.name,
            owner: ownerName ? ownerName : node.owner.name,
            url: node.url,
        };
    });
}

export function mapOrganizations(nodes: OrganizationNode[]): GitHubOrganizationData[] {
    return nodes.map((node) => {
        return {
            name: node.name,
            repositories: [],
        };
    });
}
