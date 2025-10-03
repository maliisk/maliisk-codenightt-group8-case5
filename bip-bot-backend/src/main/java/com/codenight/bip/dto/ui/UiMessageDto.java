package com.codenight.bip.dto.ui;

import java.time.Instant;

public record UiMessageDto(
        String id,
        String userId,
        String text,
        Instant createdAt,
        Boolean fromMe,
        Boolean system
) {}
