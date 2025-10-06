package com.codenight.bip.web;

import com.codenight.bip.domain.Choice;
import com.codenight.bip.domain.Event;
import com.codenight.bip.domain.Expense;
import com.codenight.bip.domain.PollVote;
import com.codenight.bip.domain.SlotVote;
import com.codenight.bip.dto.ui.SurveyDto;
import com.codenight.bip.dto.ui.SurveySubmitReq;
import com.codenight.bip.repo.EventRepo;
import com.codenight.bip.repo.ExpenseRepo;
import com.codenight.bip.repo.PollChoiceRepo;
import com.codenight.bip.repo.PollRepo;
import com.codenight.bip.repo.PollVoteRepo;
import com.codenight.bip.repo.SlotRepo;
import com.codenight.bip.repo.SlotVoteRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/ui")
@RequiredArgsConstructor
public class UiSurveyController {

    private final EventRepo eventRepo;
    private final SlotRepo slotRepo;
    private final SlotVoteRepo slotVoteRepo;
    private final PollRepo pollRepo;
    private final PollChoiceRepo choiceRepo;
    private final PollVoteRepo voteRepo;
    private final ExpenseRepo expenseRepo;

    @GetMapping("/survey")
    public SurveyDto getSurvey(@RequestParam String groupId,
                               @RequestParam String userId) {

        Event ev = eventRepo.findTopByGroupIdOrderByCreatedAtDesc(groupId).orElse(null);
        if (ev == null || !ev.isPublished()) {
            return SurveyDto.none();
        }

        var slots = slotRepo.findByEvent_EventId(ev.getEventId()).stream()
                .map(s -> new SurveyDto.SlotItem(
                        s.getSlotId(), s.getStartTime(), s.getEndTime(),
                        slotVoteRepo.countByEvent_EventIdAndSlot_SlotIdAndChoice(ev.getEventId(), s.getSlotId(), Choice.YES)
                ))
                .toList();

        var poll = pollRepo.findFirstByEvent_EventIdOrderByPollIdAsc(ev.getEventId()).orElse(null);
        List<SurveyDto.ChoiceItem> choices = List.of();
        if (poll != null) {
            choices = choiceRepo.findByPoll_PollId(poll.getPollId()).stream()
                    .map(c -> new SurveyDto.ChoiceItem(
                            c.getChoiceId(), c.getText(),
                            voteRepo.countByChoice_ChoiceId(c.getChoiceId())
                    ))
                    .toList();
        }

        Long mySlotId = slotVoteRepo
                .findByEvent_EventIdAndUserId(ev.getEventId(), userId).stream()
                .filter(v -> v.getChoice() == Choice.YES)
                .map(v -> v.getSlot().getSlotId())
                .findFirst()
                .orElse(null);

        Long myChoiceId = (poll == null) ? null
                : voteRepo.findByPoll_PollIdAndUserId(poll.getPollId(), userId)
                .map(v -> v.getChoice().getChoiceId())
                .orElse(null);

        var myExpense = expenseRepo.findByEvent_EventIdAndUserId(ev.getEventId(), userId)
                .stream().findFirst().orElse(null);

        boolean submitted = mySlotId != null || myChoiceId != null || myExpense != null;

        return new SurveyDto(
                ev.getEventId(),
                ev.getTitle(),
                ev.isPublished(),
                slots,
                choices,
                new SurveyDto.MyAnswers(
                        mySlotId,
                        myChoiceId,
                        myExpense != null,
                        myExpense != null ? myExpense.getAmount() : null
                ),
                submitted
        );
    }

    @PostMapping("/survey/submit")
    @Transactional
    public Map<String, Object> submit(@RequestBody SurveySubmitReq req) {
        var ev = eventRepo.findById(req.eventId()).orElseThrow();

        if (req.slotId() != null) {
            var slot = slotRepo.findById(req.slotId()).orElseThrow();
            var v = slotVoteRepo
                    .findByEvent_EventIdAndSlot_SlotIdAndUserId(ev.getEventId(), slot.getSlotId(), req.userId())
                    .orElse(SlotVote.builder().event(ev).slot(slot).userId(req.userId()).build());
            v.setChoice(Choice.YES);
            slotVoteRepo.save(v);
        }

        if (req.choiceId() != null) {
            var ch = choiceRepo.findById(req.choiceId()).orElseThrow();
            voteRepo.findByPoll_PollIdAndUserId(ch.getPoll().getPollId(), req.userId())
                    .ifPresent(voteRepo::delete);
            voteRepo.save(PollVote.builder()
                    .poll(ch.getPoll())
                    .choice(ch)
                    .userId(req.userId())
                    .build());
        }

        if (req.participate() != null) {
            var existing = expenseRepo.findByEvent_EventIdAndUserId(ev.getEventId(), req.userId());
            if (Boolean.TRUE.equals(req.participate())) {
                var ex = existing.stream().findFirst()
                        .orElse(Expense.builder().event(ev).userId(req.userId()).build());
                ex.setAmount(req.amount() != null ? req.amount() : BigDecimal.ZERO);
                ex.setNotes("User submit");
                ex.setWeight(BigDecimal.ONE);
                expenseRepo.save(ex);
            } else {
                existing.forEach(expenseRepo::delete);
            }
        }

        return Map.of("ok", true);
    }

    @GetMapping("/survey/results")
    public Map<String, Object> results(@RequestParam String groupId,
                                       @RequestParam String requesterId) {
        Event ev = eventRepo.findTopByGroupIdOrderByCreatedAtDesc(groupId)
                .orElseThrow(() -> new IllegalStateException("Bu grupta etkinlik yok."));

        if (!Objects.equals(ev.getCreatedBy(), requesterId)) {
            return Map.of("ok", false, "error", "Yetkisiz: sadece moderatör görebilir.");
        }

        var slotItems = slotRepo.findByEvent_EventId(ev.getEventId()).stream()
                .map(s -> Map.<String, Object>of(
                        "slotId", s.getSlotId(),
                        "start", s.getStartTime(),
                        "end",   s.getEndTime(),
                        "yes",   slotVoteRepo.countBySlot_SlotIdAndChoice(s.getSlotId(), Choice.YES),
                        "no",    slotVoteRepo.countBySlot_SlotIdAndChoice(s.getSlotId(), Choice.NO)
                ))
                .toList();

        var poll = pollRepo.findFirstByEvent_EventIdOrderByPollIdAsc(ev.getEventId()).orElse(null);
        List<Map<String, Object>> choiceItems = List.of();
        if (poll != null) {
            choiceItems = choiceRepo.findByPoll_PollId(poll.getPollId()).stream()
                    .map(c -> Map.<String, Object>of(
                            "choiceId", c.getChoiceId(),
                            "text",     c.getText(),
                            "votes",    voteRepo.countByChoice_ChoiceId(c.getChoiceId())
                    ))
                    .toList();
        }

        var expenses = expenseRepo.findByEvent_EventId(ev.getEventId()).stream()
                .map(ex -> Map.<String, Object>of(
                        "userId", ex.getUserId(),
                        "amount", ex.getAmount(),
                        "notes",  ex.getNotes()
                ))
                .toList();

        return Map.of(
                "ok", true,
                "eventId", ev.getEventId(),
                "title", ev.getTitle(),
                "published", ev.isPublished(),
                "slots", slotItems,
                "places", choiceItems,
                "expenses", expenses
        );
    }
}
