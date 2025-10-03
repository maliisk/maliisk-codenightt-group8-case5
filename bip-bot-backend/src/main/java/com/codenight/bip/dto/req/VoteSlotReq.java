package com.codenight.bip.dto.req;

import com.codenight.bip.domain.Choice;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record VoteSlotReq(
        @NotBlank String userId,
        @NotNull Long slotId,
        @NotNull Choice choice
) {}
