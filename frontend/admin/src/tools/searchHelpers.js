export function makeSearchableLinks(links) {
    return links.flatMap((link) => {
        const base = {
            name: link.name,
            path: link.path,
            keywords: [
                link.name.toLowerCase(),
                `create ${link.name.toLowerCase()}`,
                `edit ${link.name.toLowerCase()}`,
                `delete ${link.name.toLowerCase()}`,
                `update ${link.name.toLowerCase()}`,
            ],
        };

        const children = (link.children || []).map((child) => ({
            name: child.name,
            path: child.path,
            keywords: [
                child.name.toLowerCase(),
                `create ${child.name.toLowerCase()}`,
                `edit ${child.name.toLowerCase()}`,
                `delete ${child.name.toLowerCase()}`,
                `update ${child.name.toLowerCase()}`,
                `attach ${child.name.toLowerCase()}`,
                `detach ${child.name.toLowerCase()}`,
            ],
        }));

        return [base, ...children];
    });
}