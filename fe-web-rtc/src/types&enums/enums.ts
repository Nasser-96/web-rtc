export enum AxiosMethods
{
    POST = 'post',
    GET = 'get',
    PUT = 'put',
    DELETE = 'delete',
    HEAD = 'head',
}

export type ReturnResponseType<T> =
{
    is_successful:boolean,
    error_msg:string,
    success:string
    response:T
}