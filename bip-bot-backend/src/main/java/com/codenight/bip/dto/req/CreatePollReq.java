package com.codenight.bip.dto.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record CreatePollReq(@NotBlank String question, @NotEmpty List<String> choices) {}
