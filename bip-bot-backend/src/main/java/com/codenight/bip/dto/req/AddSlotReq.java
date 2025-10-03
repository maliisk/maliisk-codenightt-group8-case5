package com.codenight.bip.dto.req;

import jakarta.validation.constraints.NotBlank;

public record AddSlotReq(@NotBlank String start, @NotBlank String end) {}
