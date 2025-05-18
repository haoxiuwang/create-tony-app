const fs = require('fs');

module.exports = {
  name: 'tony-syntax-sugar',
  setup(build) {
    build.onLoad({ filter: /\.js$/ }, async (args) => {
      let source = await fs.promises.readFile(args.path, 'utf8');
      const transformed = source.replace(/^(.+)\s*!(true)?\s*\;?\s*$/mg, (_,a,b)=>`if(!${a.trim()})return ${b?b:"false"}`);
      return { contents: transformed, loader: 'js' };
    });
  }
}
