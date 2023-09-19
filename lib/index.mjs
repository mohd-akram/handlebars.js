import handlebars from './handlebars/index.js';
import { PrintVisitor, print } from './handlebars/compiler/printer.js';

handlebars.PrintVisitor = PrintVisitor;
handlebars.print = print;

export default handlebars;
