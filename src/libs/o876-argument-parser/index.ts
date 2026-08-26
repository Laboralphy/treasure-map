/**
 * Argument Parser
 *
 * @description This tool parses any array of strings and tries to extract variables and values out of it.
 * It relies on a json definition given before parsing.
 * It gives a simple structure that associates variables and values.
 *
 * @author Raphaël Marandet
 * @email raphael.marandet(at)gmail(dot)com
 * @date 2019-06-12
 */

export interface ArgumentValueDef {
    required?: boolean;
    type?: string;
    default?: string | number | boolean;
}

export interface ArgumentDef {
    name: string;
    long?: string;
    short?: string;
    required?: boolean;
    desc: string;
    value?: ArgumentValueDef;
}

export type ParsedArguments = Record<string, string | number | boolean>;

interface Switch {
    value: string;
}

export interface CommandLineArguments {
    switches: Record<string, Switch>;
    words: string[];
}

let ARGUMENTS: ArgumentDef[] = [];

/**
 * Get the previously set argument definition (see setArgumentDefinition)
 */
export function getArgumentDefinition(): ArgumentDef[] {
    return ARGUMENTS;
}

/**
 * Set argument definition (see setArgumentDefinition)
 */
export function setArgumentDefinition(a: ArgumentDef[]): void {
    ARGUMENTS = a;
}

export function getArgumentLongValueString(oArg: ArgumentDef): string {
    if (oArg.value) {
        const sType = oArg.value.type || 'any';
        if (oArg.value.required) {
            return '=<' + sType + '>';
        } else {
            return '[=' + sType + ']';
        }
    } else {
        return '';
    }
}

export function getArgumentShortValueString(oArg: ArgumentDef): string {
    if (oArg.value) {
        const sType = oArg.value.type || 'any';
        if (oArg.value.required) {
            return ' <' + sType + '>';
        } else {
            return ' [' + sType + ']';
        }
    } else {
        return '';
    }
}

/**
 * Returns a string describing the syntax of the specified argument definition
 */
export function getArgumentSyntax(oArg: ArgumentDef): string {
    const aVars: string[] = [];
    if (oArg.short !== undefined && oArg.short.length > 0) {
        aVars.push('-' + oArg.short + getArgumentShortValueString(oArg));
    }
    if (oArg.long !== undefined && oArg.long.length > 0) {
        aVars.push('--' + oArg.long + getArgumentLongValueString(oArg));
    }
    return aVars.join(', ');
}

/**
 * Returns a string of the specified argument definition
 */
export function getArgumentString(oArg: ArgumentDef): string {
    return '\t' + getArgumentSyntax(oArg) + '\n\t\t' + oArg.desc;
}

/**
 * Checks if all required arguments are present
 */
export function checkRequiredArguments(
    oArgs: Record<string, Switch>,
    aArgDef: ArgumentDef[]
): void {
    const r = aArgDef.filter(
        (a) =>
            a.required &&
            !(a.short !== undefined && a.short in oArgs) &&
            !(a.long !== undefined && a.long in oArgs)
    );
    if (r.length > 0) {
        throw new Error(
            'some missing arguments : ' +
                r.map((a) => getArgumentSyntax(a)) +
                ' - given argument are : ' +
                Object.keys(oArgs).join(', ')
        );
    }
}

function searchArgumentDefinition(sArg: string, aArgDef: ArgumentDef[]): ArgumentDef | undefined {
    return aArgDef.find((a) => a.long === sArg || a.short === sArg);
}

export function checkRequiredArgumentValues(
    oArgs: Record<string, Switch>,
    aArgDef: ArgumentDef[]
): void {
    for (const sArg in oArgs) {
        if (oArgs[sArg].value.length === 0) {
            const oSearched = searchArgumentDefinition(sArg, aArgDef);
            if (oSearched && oSearched.value && oSearched.value.required) {
                throw new Error(
                    'value required for argument "' + sArg + '" : ' + getArgumentSyntax(oSearched)
                );
            }
        }
    }
}

export function buildArgumentStructure(
    oArgs: Record<string, Switch>,
    aArgDef: ArgumentDef[]
): ParsedArguments {
    checkRequiredArguments(oArgs, aArgDef);
    checkRequiredArgumentValues(oArgs, aArgDef);
    const oOutput: ParsedArguments = {};
    for (const sArg in oArgs) {
        if (sArg === '') {
            continue;
        }
        const value = oArgs[sArg].value;
        const oSearched = searchArgumentDefinition(sArg, aArgDef);
        if (oSearched) {
            const name = oSearched.name;
            if (oSearched.value) {
                switch (oSearched.value.type) {
                    case 'number':
                        oOutput[name] = parseFloat(value);
                        break;

                    case 'boolean':
                        oOutput[name] = !!parseInt(value);
                        break;

                    default:
                        oOutput[name] = value;
                        break;
                }
            } else {
                oOutput[name] = true;
            }
        } else {
            throw new Error('command line parse error : unknown option : "' + sArg + '"');
        }
    }
    return oOutput;
}

/**
 * Returns the command line parameters
 */
export function getCommandLineArguments(aArgs: string[]): CommandLineArguments {
    const REG = /^([-_.a-zA-Z0-9]+)=(.*)/;
    // a lone negative number is the value of the previous switch, not a pack of short
    // switches : "-x -20" must not be read as the three switches x, 2 and 0
    const NEGATIVE_NUMBER = /^-\d*\.?\d+$/;
    const oSwitches: Record<string, Switch> = {};
    const aAlone: string[] = [];
    let sLastSwitch = '';
    for (let i = 0; i < aArgs.length; ++i) {
        const sWord = aArgs[i];
        if (sWord.startsWith('--')) {
            const w = sWord.substring(2);
            const r = w.match(REG);
            sLastSwitch = '';
            if (r) {
                oSwitches[r[1]] = { value: r[2] };
            } else {
                oSwitches[w] = { value: '' };
            }
        } else if (sWord.startsWith('-') && !NEGATIVE_NUMBER.test(sWord)) {
            sWord
                .substring(1)
                .split('')
                .forEach((w) => {
                    sLastSwitch = w;
                    oSwitches[sLastSwitch] = { value: '' };
                });
        } else {
            if (sLastSwitch.length) {
                oSwitches[sLastSwitch].value = sWord;
                sLastSwitch = '';
            } else {
                aAlone.push(sWord);
            }
        }
    }
    return {
        switches: oSwitches,
        words: aAlone,
    };
}

export function parse(aArgs: string[]): ParsedArguments {
    if (!Array.isArray(aArgs)) {
        throw new TypeError('ArgumentParser.parse : This function requires an array.');
    }
    const r = getCommandLineArguments(aArgs);
    return buildArgumentStructure(r.switches, getArgumentDefinition());
}

export function getHelpString(): string {
    return getArgumentDefinition()
        .map((d) => getArgumentString(d))
        .join('\n\n');
}

export default {
    getCommandLineArguments,
    checkRequiredArguments,
    checkRequiredArgumentValues,
    getArgumentString,
    setArgumentDefinition,
    getArgumentShortValueString,
    getArgumentLongValueString,
    buildArgumentStructure,
    parse,
    getHelpString,
};
