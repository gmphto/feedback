import * as React from 'react';

import * as ContextSelector from 'use-context-selector';

// Adapted from Strapi's Context.tsx at f4853fa068f7b359f40ba25dde5a27f646feb4ff.
// Copyright (c) 2015-present Strapi Solutions SAS. See Context.LICENSE.
function createContext<ContextValueType extends object | null>(
  defaultContext?: ContextValueType
) {
  const Context = ContextSelector.createContext<ContextValueType | undefined>(defaultContext);

  const Provider = (props: ContextValueType & { children: React.ReactNode }) => {
    const { children, ...context } = props;
    // Only re-memoize when prop values change.
    const value = React.useMemo(() => context, Object.values(context)) as ContextValueType;

    return (
      <Context.Provider value={value}>
        {children}
      </Context.Provider>
    );
  };

  function useContext<Selected, ShouldThrow extends boolean = true>(
    consumerName: string,
    selector: (value: ContextValueType) => Selected,
    shouldThrowOnMissingContext?: ShouldThrow
  ) {
    return ContextSelector.useContextSelector(Context, (context) => {
      if (context) {
        return selector(context);
      }

      if (shouldThrowOnMissingContext) {
        throw new Error(`\`${consumerName}\` must be used within \`\``);
      }

      return undefined;
    }) as ShouldThrow extends true ? Selected : Selected | undefined;
  }

  Provider.displayName = 'Provider';

  return [Provider, useContext] as const;
}

export { createContext };
