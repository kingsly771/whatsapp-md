class Plugin {
  constructor(id, name, description, code, category = 'general', version = '1.0.0') {
    this.id = id;
    this.name = name;
    this.description = description;
    this.code = code;
    this.category = category;
    this.version = version;
    this.enabled = false;
    this.config = {};
    this.dependencies = [];
  }
  
  enable() {
    this.enabled = true;
  }
  
  disable() {
    this.enabled = false;
  }
  
  setConfig(config) {
    this.config = { ...this.config, ...config };
  }
  
  addDependency(dependency) {
    if (!this.dependencies.includes(dependency)) {
      this.dependencies.push(dependency);
    }
  }
}

module.exports = Plugin;
