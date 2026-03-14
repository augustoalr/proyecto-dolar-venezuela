class BaseProvider {
  constructor(name) {
    this.name = name;
  }

  async getPrice() {
    throw new Error('Method getPrice() must be implemented');
  }
}

module.exports = BaseProvider;
