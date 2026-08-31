package com.internal.shared.logging;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

/**
 * Aspect for monitoring database performance and highlighting slow repository queries.
 */
@Aspect
@Component
@Slf4j
public class DatabasePerformanceAspect {

    private static final long SLOW_QUERY_THRESHOLD_MS = 500;

    @Pointcut("within(@org.springframework.stereotype.Repository *) || execution(* org.springframework.data.repository.Repository+.*(..))")
    public void repositoryPointcut() {}

    @Around("repositoryPointcut()")
    public Object logRepositoryExecution(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().toShortString();
        long start = System.currentTimeMillis();
        try {
            Object result = joinPoint.proceed();
            long duration = System.currentTimeMillis() - start;
            if (duration > SLOW_QUERY_THRESHOLD_MS) {
                log.warn("[DatabasePerformance] Slow database operation detected. operation={}, durationMs={}", methodName, duration);
            } else if (log.isDebugEnabled()) {
                log.debug("[DatabasePerformance] Query completed. operation={}, durationMs={}", methodName, duration);
            }
            return result;
        } catch (Throwable ex) {
            long duration = System.currentTimeMillis() - start;
            log.error("[DatabasePerformance] Database operation failed. operation={}, durationMs={}, error={}", methodName, duration, ex.getMessage(), ex);
            throw ex;
        }
    }
}
