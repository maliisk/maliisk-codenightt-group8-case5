package com.codenight.bip.web;

import com.codenight.bip.domain.Expense;
import com.codenight.bip.domain.Event;
import com.codenight.bip.domain.Poll;
import com.codenight.bip.domain.Slot;
import com.codenight.bip.dto.SummaryDto;
import com.codenight.bip.dto.req.*;
import com.codenight.bip.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class EventController {

    private final EventService svc;

    @PostMapping("/events") public Event create(@Valid @RequestBody CreateEventReq r){ return svc.create(r); }
    @PostMapping("/events/{id}/slots") public Slot addSlot(@PathVariable Long id,@Valid @RequestBody AddSlotReq r){ return svc.addSlot(id,r); }
    @PostMapping("/events/{id}/vote-slot") public void voteSlot(@PathVariable Long id,@Valid @RequestBody VoteSlotReq r){ svc.voteSlot(id,r); }
    @PostMapping("/events/{id}/poll") public Poll createPoll(@PathVariable Long id,@Valid @RequestBody CreatePollReq r){ return svc.createPoll(id,r); }
    @PostMapping("/events/{id}/vote") public void vote(@PathVariable Long id,@Valid @RequestBody VotePollReq r){ svc.votePoll(id,r); }
    @PostMapping("/events/{id}/expense") public Expense expense(@PathVariable Long id,@Valid @RequestBody AddExpenseReq r){ return svc.addExpense(id,r); }
    @GetMapping("/events/{id}/summary") public SummaryDto summary(@PathVariable Long id){ return svc.summary(id); }

    @GetMapping("/events/{id}/poll-choices")
    public java.util.List<com.codenight.bip.dto.PollChoiceDto> pollChoices(@PathVariable Long id) {
        var pollOpt = svc.getFirstPoll(id);
        if (pollOpt.isEmpty()) return java.util.List.of();
        var poll = pollOpt.get();
        var choices = svc.getChoices(poll.getPollId());
        return choices.stream()
                .map(ch -> new com.codenight.bip.dto.PollChoiceDto(
                        ch.getChoiceId(), ch.getText(), svc.countVotes(ch.getChoiceId())))
                .toList();
    }

    @PostMapping("/events/{id}/remind")
    public Map<String,String> remind(@PathVariable Long id){
        var s = svc.summary(id);
        return Map.of("message", "Gruba gönderildi (mock): "+s.toShortText());
    }
}
