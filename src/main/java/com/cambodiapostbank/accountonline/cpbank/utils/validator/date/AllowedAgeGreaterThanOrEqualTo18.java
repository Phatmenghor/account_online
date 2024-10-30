package com.cambodiapostbank.accountonline.cpbank.utils.validator.date;


import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;

public class AllowedAgeGreaterThanOrEqualTo18 implements ConstraintValidator<AllowedAge, String> {
    private int minAge;
    @Override
    public void initialize(AllowedAge constraintAnnotation) {
        minAge = constraintAnnotation.minAge();
        //ConstraintValidator.super.initialize(constraintAnnotation);
    }

    @Override
    public boolean isValid(String dateOfBirth, ConstraintValidatorContext constraintValidatorContext) {
        if (dateOfBirth == null || dateOfBirth.equals("")) return false;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("d/MM/yyyy");
        LocalDate dob = LocalDate.parse(dateOfBirth, formatter);
        return Period.between(dob, LocalDate.now()).getYears() >= minAge;
    }
}
