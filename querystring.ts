import * as _ from 'underscore';

export function encodeQuerystring(obj: Object): any {
    return obj == null || _.isEmpty(obj) ? null :  _.map(_.pairs(obj),pair=>`${pair[0]}=${pair[1]}`).join('&');
}