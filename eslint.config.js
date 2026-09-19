import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

// ─── Regex para detectar cores hardcoded em className ────────────────────────
// Detecta: #RGB, #RRGGBB, rgba(...), rgb(...)
const HEX_OR_RGB_RE = /#[0-9a-fA-F]{3,8}|rgba?\s*\(/

/**
 * Regra inline: proíbe hex/rgba hardcoded em className.
 * Cobre Literal strings e TemplateLiteral no atributo className.
 * Use tokens de tema CSS (--color-primary, etc.) em vez de cores brutas.
 * Ref: CLAUDE.md — Pilar 3.1 e Design conventions.
 */
const noHexClassnameRule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Proibir cores hex/rgba hardcoded em className. Use tokens CSS do @theme. Ver CLAUDE.md Pilar 3.1.',
    },
    messages: {
      noHex:
        'Cor hardcoded detectada em className: "{{ color }}". Use tokens CSS (ex: text-primary, bg-success) em vez de valores hex/rgba diretos.',
    },
    schema: [],
  },
  create(context) {
    /**
     * Percorre recursivamente qualquer subárvore de expressão e relata
     * strings (Literal ou TemplateLiteral) que contenham hex/rgba.
     * Cobre: className="...", className={"..."}, className={cn("...", cond ? "..." : "...")}, etc.
     */
    function walk(node, reportNode) {
      if (!node) return

      if (node.type === 'Literal' && typeof node.value === 'string') {
        const match = HEX_OR_RGB_RE.exec(node.value)
        if (match) {
          context.report({
            node: reportNode,
            messageId: 'noHex',
            data: { color: match[0] },
          })
        }
        return
      }

      if (node.type === 'TemplateLiteral') {
        for (const quasi of node.quasis) {
          const match = HEX_OR_RGB_RE.exec(quasi.value.raw)
          if (match) {
            context.report({
              node: reportNode,
              messageId: 'noHex',
              data: { color: match[0] },
            })
          }
        }
        return
      }

      // Percorre filhos relevantes sem registrar falsos positivos em outros nós
      if (node.type === 'CallExpression') {
        for (const arg of node.arguments) walk(arg, reportNode)
        return
      }
      if (node.type === 'ConditionalExpression') {
        walk(node.consequent, reportNode)
        walk(node.alternate, reportNode)
        return
      }
      if (node.type === 'LogicalExpression') {
        walk(node.left, reportNode)
        walk(node.right, reportNode)
        return
      }
      if (node.type === 'ArrayExpression') {
        for (const el of node.elements) walk(el, reportNode)
      }
    }

    return {
      JSXAttribute(node) {
        if (
          node.name.type !== 'JSXIdentifier' ||
          node.name.name !== 'className'
        )
          return

        const val = node.value
        if (!val) return

        if (val.type === 'Literal') {
          walk(val, node)
        } else if (val.type === 'JSXExpressionContainer') {
          walk(val.expression, node)
        }
      },
    }
  },
}

export default [
  {
    ignores: ['dist', 'node_modules'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: globals.browser,
      parser: tseslint.parser,
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'simple-import-sort': simpleImportSort,
      // Plugin inline para convenções do projeto
      'vanhora': {
        rules: {
          'no-hex-classname': noHexClassnameRule,
        },
      },
    },
    rules: {
      // simple import sort
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      // react Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // react Refresh
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // typeScript
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // ── Convenções vanhora (CLAUDE.md) ───────────────────────────────────

      // Proibir react-icons: usar somente lucide-react
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react-icons', 'react-icons/*'],
              message:
                'Proibido: use lucide-react. Ver CLAUDE.md — Icons: Lucide React only.',
            },
          ],
        },
      ],

      // Proibir hex/rgba direto em className
      'vanhora/no-hex-classname': 'error',
    },
  },
]
