import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import {map} from "rxjs/operators"

export interface ApiResponse<T>{
    success: boolean;
    statusCode: number;
    message: string;
    data:T;
    timestamp: string

}
@Injectable()
export class ResponseInterceptor<T>
    implements NestInterceptor<T, ApiResponse<T>>{
        intercept (context: ExecutionContext,
             next: CallHandler<T>
            ): Observable<ApiResponse<T>> {
            const statusCode = context
            .switchToHttp()
            .getResponse().statusCode;


            return next.handle().pipe(
                map((data: any)=>({
                    success: true,
                    statusCode,
                    message: data?.message  ??  'Success',
                    data: data?.data ?? data,
                    timestamp: new Date().toDateString()
                }))
            )
        }
    }