
export const SYMBOL_OVERIDES :Record< string, string> = {
    'SAVANI.NS': '511577.BO',
    'LTIM.NS': 'LTM.NS'
}

export const resolveSymbols = (symbol : string) : string => SYMBOL_OVERIDES[symbol] ?? symbol
