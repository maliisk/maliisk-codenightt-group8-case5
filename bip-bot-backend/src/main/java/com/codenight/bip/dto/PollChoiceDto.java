package com.codenight.bip.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data @AllArgsConstructor
public class PollChoiceDto {
    private Long choiceId;
    private String text;
    private long votes;
}
