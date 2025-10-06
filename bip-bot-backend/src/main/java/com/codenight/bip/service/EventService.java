package com.codenight.bip.service;

import com.codenight.bip.domain.*;
import com.codenight.bip.dto.SummaryDto;
import com.codenight.bip.dto.req.*;
import com.codenight.bip.repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EventService {

    private final EventRepo eventRepo;
    private final SlotRepo slotRepo;
    private final SlotVoteRepo slotVoteRepo;
    private final PollRepo pollRepo;
    private final PollChoiceRepo choiceRepo;
    private final PollVoteRepo voteRepo;
    private final ExpenseRepo expenseRepo;


    public Event create(CreateEventReq req) {
        Event e = Event.builder()
                .title(req.title())
                .createdBy(req.createdBy())
                .groupId(req.groupId())
                .createdAt(Instant.now())
                .build();
        return eventRepo.save(e);
    }

    public Slot addSlot(Long eventId, AddSlotReq req) {
        Event e = eventRepo.findById(eventId).orElseThrow();
        Slot s = Slot.builder()
                .event(e)
                .startTime(Instant.parse(req.start()))
                .endTime(Instant.parse(req.end()))
                .build();
        return slotRepo.save(s);
    }

    public void voteSlot(Long eventId, VoteSlotReq req) {
        Event e = eventRepo.findById(eventId).orElseThrow();
        Slot s = slotRepo.findById(req.slotId()).orElseThrow();
        if (!Objects.equals(s.getEvent().getEventId(), eventId))
            throw new IllegalArgumentException("slot mismatch");

        SlotVote v = slotVoteRepo
                .findByEvent_EventIdAndSlot_SlotIdAndUserId(eventId, req.slotId(), req.userId())
                .orElse(SlotVote.builder().event(e).slot(s).userId(req.userId()).build());

        v.setChoice(req.choice());
        slotVoteRepo.save(v);
    }


    public Poll createPoll(Long eventId, CreatePollReq req) {
        Event e = eventRepo.findById(eventId).orElseThrow();
        Poll p = pollRepo.save(Poll.builder().event(e).question(req.question()).locked(false).build());
        for (String t : req.choices()) {
            choiceRepo.save(PollChoice.builder().poll(p).text(t).build());
        }
        return p;
    }


    public void createOrAppendPlaceChoice(Long eventId, String placeText) {
        final String QUESTION = "Mekan seçimi";

        Optional<Poll> maybe = pollRepo.findByEvent_EventIdAndQuestionAndLockedFalse(eventId, QUESTION);

        if (maybe.isEmpty()) {
            createPoll(eventId, new CreatePollReq(QUESTION, List.of(placeText)));
            return;
        }

        Poll poll = maybe.get();

        boolean exists = choiceRepo.existsByPoll_PollIdAndTextIgnoreCase(poll.getPollId(), placeText);
        if (!exists) {
            PollChoice ch = new PollChoice();
            ch.setPoll(poll);
            ch.setText(placeText);
            choiceRepo.save(ch);
        }
    }

    public void votePoll(Long eventId, VotePollReq req) {
        PollChoice c = choiceRepo.findById(req.choiceId()).orElseThrow();
        if (!Objects.equals(c.getPoll().getEvent().getEventId(), eventId))
            throw new IllegalArgumentException("poll mismatch");

        voteRepo.findByPoll_PollIdAndUserId(c.getPoll().getPollId(), req.userId())
                .ifPresent(voteRepo::delete);

        voteRepo.save(PollVote.builder().poll(c.getPoll()).choice(c).userId(req.userId()).build());
    }


    public Expense addExpense(Long eventId, AddExpenseReq req) {
        Event e = eventRepo.findById(eventId).orElseThrow();
        Expense ex = Expense.builder()
                .event(e)
                .userId(req.userId())
                .amount(req.amount())
                .notes(req.notes())
                .weight(req.weight() == null ? BigDecimal.ONE : req.weight())
                .build();
        return expenseRepo.save(ex);
    }


    @Transactional(readOnly = true)
    public SummaryDto summary(Long eventId) {
        Event e = eventRepo.findById(eventId).orElseThrow();

        List<Slot> slots = slotRepo.findByEvent_EventId(eventId);
        Slot winner = null;
        long maxYes = -1;

        if (e.getForcedSlotId() != null) {
            Slot forced = slotRepo.findById(e.getForcedSlotId()).orElse(null);
            if (forced != null && Objects.equals(forced.getEvent().getEventId(), eventId)) {
                winner = forced;
                maxYes = Long.MAX_VALUE;
            }
        }

        for (Slot s : slots) {
            long yes = slotVoteRepo.countBySlot_SlotIdAndChoice(s.getSlotId(), Choice.YES);
            if (yes > maxYes) { maxYes = yes; winner = s; }
        }

        Optional<Poll> maybePoll = pollRepo.findFirstByEvent_EventIdOrderByPollIdAsc(eventId);
        PollChoice topChoice = null;
        long maxVotes = -1;
        if (maybePoll.isPresent()) {
            List<PollChoice> choices = choiceRepo.findByPoll_PollId(maybePoll.get().getPollId());
            for (PollChoice ch : choices) {
                long v = voteRepo.countByChoice_ChoiceId(ch.getChoiceId());
                if (v > maxVotes) { maxVotes = v; topChoice = ch; }
            }
        }

        List<Expense> expenses = expenseRepo.findByEvent_EventId(eventId);
        BigDecimal total = expenses.stream().map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, BigDecimal> weights = expenses.stream()
                .collect(Collectors.groupingBy(Expense::getUserId,
                        Collectors.mapping(Expense::getWeight,
                                Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))));

        BigDecimal weightSum = weights.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        Map<String, BigDecimal> pay = new HashMap<>();
        for (var e2 : weights.entrySet()) {
            BigDecimal share = weightSum.compareTo(BigDecimal.ZERO) == 0
                    ? BigDecimal.ZERO
                    : total.multiply(e2.getValue()).divide(weightSum, 2, RoundingMode.HALF_UP);
            pay.put(e2.getKey(), share);
        }

        Map<String, BigDecimal> spent = expenses.stream()
                .collect(Collectors.groupingBy(Expense::getUserId,
                        Collectors.mapping(Expense::getAmount,
                                Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))));

        Set<String> users = new HashSet<>(); users.addAll(pay.keySet()); users.addAll(spent.keySet());
        Map<String, BigDecimal> balances = new HashMap<>();
        for (String u : users) {
            BigDecimal s = spent.getOrDefault(u, BigDecimal.ZERO);
            BigDecimal p = pay.getOrDefault(u, BigDecimal.ZERO);
            balances.put(u, s.subtract(p));
        }

        return new SummaryDto(e.getEventId(), e.getTitle(), winner, topChoice, total, balances);
    }


    public Optional<Poll> getFirstPoll(Long eventId){
        return pollRepo.findFirstByEvent_EventIdOrderByPollIdAsc(eventId);
    }
    public List<PollChoice> getChoices(Long pollId){
        return choiceRepo.findByPoll_PollId(pollId);
    }
    public long countVotes(Long choiceId){
        return voteRepo.countByChoice_ChoiceId(choiceId);
    }
    public void publish(Long eventId) {
        Event e = eventRepo.findById(eventId).orElseThrow();
        e.setPublished(true);
        eventRepo.save(e);
    }
}
