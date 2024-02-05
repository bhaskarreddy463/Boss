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
