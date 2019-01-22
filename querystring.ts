import * as _ from 'underscore';

export function encodeQuerystring(obj: Object): any {
    let removeEmpty = function(list: any):any{
        return list == null ? null:  _.filter(list, item=>!_.isEmpty(item[1]));
    };

    let encode = function(list: any): string {
        return list == null || _.isEmpty(list) ? null : encodeURI(_.map(list, pair=>`${pair[0]}=${pair[1]}`).join('&'));
    };

    return encode(removeEmpty(obj == null || _.isEmpty(obj) ? null :_.pairs(obj)));
    
}