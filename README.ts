private formatLevels(level: Map<string, Object>): GSH {
    const gsh = <GSH>{};
    gsh.value = level.keys().next().value;
    gsh.children = [];
    const children = level.values().next().value;
    const childMap = new Map<string, Object>(Object.entries(children));
    if (!children) {
      return gsh;
    }

    const childCondition = Object.keys(children).length;
    if (childCondition > 0) {
      Object.keys(children).forEach((key) => gsh.children.push(this.formatLevels(new Map().set(key, childMap.get(key)))));
    }

    return gsh;
  }


private formatLevels(level: Map<string, MyNode>): GSH {
  const gsh: GSH = {
    value: '',
    children: []
  };

  const firstEntry = level.entries().next().value;

  if (!firstEntry) {
    return gsh;
  }

  const [key, currentNode] = firstEntry;

  gsh.value = currentNode.key;

  if (currentNode.children) {
    currentNode.children.forEach((childNode, childKey) => {
      const childMap = new Map<string, MyNode>().set(childKey, childNode);
      gsh.children.push(this.formatLevels(childMap));
    });
  }

  return gsh;
}

https://gitlab.aws.site.gs.com/wf/mwp-ui/gs-ux-uitoolkit/-/blob/master/components/popover/angular/src/popover.directive.ts

