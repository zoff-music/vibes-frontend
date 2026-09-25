import { createRequire } from 'node:module';
import type { Logger } from 'babel-plugin-react-compiler';
import babel from 'vite-plugin-babel';

const require = createRequire(import.meta.url);

export function reactCompiler() {
  const diagnostics = new Set<string>();
  const logger: Logger = {
    logEvent(filename, event) {
      if (event.kind !== 'CompileError' && event.kind !== 'CompileDiagnostic')
        return;

      const diagnostic = `[React Compiler] ${filename}: ${event.detail.reason}`;
      if (diagnostics.has(diagnostic)) return;

      diagnostics.add(diagnostic);
      console.warn(diagnostic);
    },
  };

  return babel({
    include:
      /\/(?:apps\/(?:platform|cast|embed|remote)\/src|packages\/ui\/src\/web)\/.*\.[jt]sx?$/,
    babelConfig: {
      babelrc: false,
      configFile: false,
      presets: [require.resolve('@babel/preset-typescript')],
      plugins: [
        [
          require.resolve('babel-plugin-react-compiler'),
          { target: '19', logger },
        ],
      ],
    },
  });
}
