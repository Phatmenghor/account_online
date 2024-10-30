package com.cambodiapostbank.accountonline.cpbank.utils.validator.date;


import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = AllowedAgeGreaterThanOrEqualTo18.class)
@Target( { ElementType.METHOD, ElementType.FIELD })
@Retention(RetentionPolicy.RUNTIME)
public @interface AllowedAge {
    String message() default "Invalid age.";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
    int minAge() default 1;
}
