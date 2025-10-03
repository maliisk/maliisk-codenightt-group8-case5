package com.codenight.bip.dto.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record AddExpenseReq(
        @NotBlank String userId,
        @NotNull BigDecimal amount,
        String notes,
        BigDecimal weight
) {}
