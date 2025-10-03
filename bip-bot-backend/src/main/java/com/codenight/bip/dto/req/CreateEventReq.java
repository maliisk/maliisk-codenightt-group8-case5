package com.codenight.bip.dto.req;

import jakarta.validation.constraints.NotBlank;

public record CreateEventReq(
        @NotBlank String title,
        @NotBlank String createdBy,
        @NotBlank String groupId
) {}
