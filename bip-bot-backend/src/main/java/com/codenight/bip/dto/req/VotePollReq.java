package com.codenight.bip.dto.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record VotePollReq(@NotBlank String userId, @NotNull Long choiceId) {}
