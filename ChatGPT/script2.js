$(document).ready(function() {
    const bookedProposals = [
      {
        "proposalId": 123,
        "Colleague Name": "Mukesh",
        "Colleague Email": "mukesh@gmail.com"
      },
      {
        "proposalId": 1234,
        "Colleague Name": "Dukesh",
        "Colleague Email": "dukesh@gmail.com"
      }
    ];
  
    const proposalDenialReasonsMaster = [
      "Skill(s) not matching",
      "Colleague not reachable",
      "Colleague involved in other project",
      "Colleague constraint(s)",
      "Legal constraint(s)",
      "Demand not valid",
      "Another colleague selected"
    ];
  
    const mustHaveSkills = ['Java', 'Angular', 'Azure'];
    const skillsFeedbacksMaster = ["Good Enough", "Not Enough", "Not Tested", "Super", "Trainable"];
    const skillsMaster = [
      {
        "bK_SkillCode": 61493,
        "skillName_Level2": "2D",
        "skillName_Level3": "Any Other Skill"
      },
      {
        "bK_SkillCode": 61491,
        "skillName_Level2": "2D",
        "skillName_Level3": "Motion graphics"
      }
    ];
  
    const $currentProposalFeedback = $('#current-proposal-feedback');
    const $otherBookedColleagues = $('#other-booked-colleagues');
  
    // Populate current proposal feedback checkboxes
    proposalDenialReasonsMaster.forEach(reason => {
      const checkboxGroup = $('<div class="form-check checkbox-group"></div>');
      const checkbox = $(`<input class="form-check-input" type="checkbox" value="${reason}" required>`);
      const label = $(`<label class="form-check-label">${reason}</label>`);
  
      checkboxGroup.append(checkbox).append(label);
      $currentProposalFeedback.find('.checkbox-container').append(checkboxGroup);
    });
  
    // Populate current proposal feedback skill dropdown
    populateSkillDropdown($currentProposalFeedback.find('.skill-dropdown'));
  
    $currentProposalFeedback.find('.skill-search').on('input', function() {
      const searchTerm = $(this).val().toLowerCase();
      const filteredSkills = skillsMaster.filter(skill => 
        skill.skillName_Level2.toLowerCase().includes(searchTerm) || 
        skill.skillName_Level3.toLowerCase().includes(searchTerm)
      );
      populateSkillDropdown($currentProposalFeedback.find('.skill-dropdown'), filteredSkills);
      $currentProposalFeedback.find('.skill-dropdown').addClass('show');
    });
  
    $currentProposalFeedback.find('.skill-dropdown').on('click', '.dropdown-item', function() {
      const selectedSkill = $(this).data('value');
      if (selectedSkill === 'Any Other Skill') {
        addNewSkillFeedbackWithTextInput($currentProposalFeedback.find('.feedback-container'), selectedSkill);
      } else {
        addNewSkillFeedback($currentProposalFeedback.find('.feedback-container'), selectedSkill);
      }
      $currentProposalFeedback.find('.skill-search').val('');
      $currentProposalFeedback.find('.skill-dropdown').removeClass('show');
    });
  
    // Show feedback fields and add skill section for current proposal feedback
    $currentProposalFeedback.find('.checkbox-container').on('change', 'input[type="checkbox"]', function() {
      if ($(this).val() === "Skill(s) not matching" && $(this).is(':checked')) {
        renderFeedbackFields($currentProposalFeedback.find('.feedback-container'));
        $currentProposalFeedback.find('.feedback-container').show();
        $currentProposalFeedback.find('.add-skill-container').show();
      } else {
        const isSkillNotMatchingSelected = $currentProposalFeedback.find('.checkbox-container input[type="checkbox"][value="Skill(s) not matching"]').is(':checked');
        if (!isSkillNotMatchingSelected) {
          $currentProposalFeedback.find('.feedback-container').hide();
          $currentProposalFeedback.find('.feedback-container').empty();
          $currentProposalFeedback.find('.add-skill-container').hide();
        }
      }
    });
  
    // Dynamically create sections for each colleague if there are booked proposals
    if (bookedProposals.length > 0) {
      bookedProposals.forEach(proposal => {
        const section = createSectionForColleague(proposal);
        $otherBookedColleagues.append(section);
      });
    }
  
    // Handle form submission
    $('#submit-all').click(function(event) {
      event.preventDefault();
  
      const responses = {
        currentProposalFeedback: gatherFormData($currentProposalFeedback),
        colleagueFeedbacks: []
      };
  
      $otherBookedColleagues.find('.dynamic-section').each(function() {
        const formData = gatherFormData($(this));
        responses.colleagueFeedbacks.push(formData);
      });
  
      $('#json-response').text(JSON.stringify(responses, null, 2));
    });
  
    // Create section for each colleague
    function createSectionForColleague(proposal) {
      const section = $('<div class="dynamic-section mb-5"></div>');
  
      const header = $(`<h5>Colleague: ${proposal["Colleague Name"]} (${proposal["Colleague Email"]})</h5>`);
      section.append(header);
  
      const checkboxContainer = $('<div class="form-group checkbox-container"></div>');
      proposalDenialReasonsMaster.forEach(reason => {
        const checkboxGroup = $('<div class="form-check checkbox-group"></div>');
        const checkbox = $(`<input class="form-check-input" type="checkbox" value="${reason}" required>`);
        const label = $(`<label class="form-check-label">${reason}</label>`);
  
        checkboxGroup.append(checkbox).append(label);
        checkboxContainer.append(checkboxGroup);
      });
      section.append(checkboxContainer);
  
      const feedbackContainer = $('<div class="form-group feedback-container"></div>');
      section.append(feedbackContainer);
  
      const addSkillContainer = $(`
        <div class="form-group searchable-dropdown add-skill-container">
          <label>Add Skill:</label>
          <input type="text" class="form-control skill-search" placeholder="Search skill...">
          <div class="dropdown-menu skill-dropdown">
            <!-- Skill options will be dynamically inserted here -->
          </div>
        </div>
      `);
      populateSkillDropdown(addSkillContainer.find('.skill-dropdown'));
      section.append(addSkillContainer);
  
      const commentField = $(`
        <div class="form-group">
          <label>Comment:</label>
          <textarea class="form-control comment-field" rows="3" placeholder="Enter your comment..."></textarea>
        </div>
      `);
      section.append(commentField);
  
      checkboxContainer.on('change', 'input[type="checkbox"]', function() {
        if ($(this).val() === "Skill(s) not matching" && $(this).is(':checked')) {
          renderFeedbackFields(feedbackContainer);
          feedbackContainer.show();
          addSkillContainer.show();
        } else {
          const isSkillNotMatchingSelected = checkboxContainer.find('input[type="checkbox"][value="Skill(s) not matching"]').is(':checked');
          if (!isSkillNotMatchingSelected) {
            feedbackContainer.hide();
            feedbackContainer.empty();
            addSkillContainer.hide();
          }
        }
      });
  
      addSkillContainer.find('.skill-search').on('input', function() {
        const searchTerm = $(this).val().toLowerCase();
        const filteredSkills = skillsMaster.filter(skill => 
          skill.skillName_Level2.toLowerCase().includes(searchTerm) || 
          skill.skillName_Level3.toLowerCase().includes(searchTerm)
        );
        populateSkillDropdown(addSkillContainer.find('.skill-dropdown'), filteredSkills);
        addSkillContainer.find('.skill-dropdown').addClass('show');
      });
  
      addSkillContainer.find('.skill-dropdown').on('click', '.dropdown-item', function() {
        const selectedSkill = $(this).data('value');
        if (selectedSkill === 'Any Other Skill') {
          addNewSkillFeedbackWithTextInput(feedbackContainer, selectedSkill);
        } else {
          addNewSkillFeedback(feedbackContainer, selectedSkill);
        }
        addSkillContainer.find('.skill-search').val('');
        addSkillContainer.find('.skill-dropdown').removeClass('show');
      });
  
      return section;
    }
  
    // Gather form data
    function gatherFormData($section) {
      const formData = {
        reasons: [],
        feedbacks: {},
        comment: $section.find('.comment-field').val()
      };
  
      $section.find('.checkbox-container input[type="checkbox"]:checked').each(function() {
        formData.reasons.push($(this).val());
      });
  
      $section.find('.feedback-container .feedback-group').each(function() {
        const skill = $(this).find('label').text();
        const feedback = $(this).find('select').val();
        if (skill === 'Any Other Skill') {
          const customSkill = $(this).find('input[type="text"]').val();
          formData.feedbacks[customSkill] = feedback;
        } else {
          formData.feedbacks[skill] = feedback;
        }
      });
  
      return formData;
    }
  
    // Render feedback fields for must-have skills
    function renderFeedbackFields($container) {
      mustHaveSkills.forEach(skill => {
        const feedbackGroup = createFeedbackGroup(skill);
        $container.append(feedbackGroup);
      });
    }
  
    // Create a feedback group
    function createFeedbackGroup(skill) {
      const feedbackGroup = $('<div class="feedback-group"></div>');
      const label = $(`<label>${skill}</label>`);
      const select = $('<select class="form-control" required></select>');
      select.append('<option value="">Select Feedback</option>');
      skillsFeedbacksMaster.forEach(feedback => {
        select.append(`<option value="${feedback}">${feedback}</option>`);
      });
      feedbackGroup.append(label).append(select);
      return feedbackGroup;
    }
  
    // Add new skill feedback
    function addNewSkillFeedback($container, skill) {
      const feedbackGroup = createFeedbackGroup(skill);
      feedbackGroup.append('<button type="button" class="btn btn-danger remove-skill-btn">Remove</button>');
      $container.append(feedbackGroup);
    }
  
    // Add new skill feedback with text input
    function addNewSkillFeedbackWithTextInput($container, skill) {
      const feedbackGroup = $('<div class="feedback-group"></div>');
      const label = $(`<label>${skill}</label>`);
      const textInput = $('<input type="text" class="form-control" placeholder="Enter skill" required>');
      const select = $('<select class="form-control" required></select>');
      select.append('<option value="">Select Feedback</option>');
      skillsFeedbacksMaster.forEach(feedback => {
        select.append(`<option value="${feedback}">${feedback}</option>`);
      });
      feedbackGroup.append(label).append(textInput).append(select).append('<button type="button" class="btn btn-danger remove-skill-btn">Remove</button>');
      $container.append(feedbackGroup);
    }
  
    // Populate skill dropdown
    function populateSkillDropdown($dropdown, skills = skillsMaster) {
      $dropdown.empty();
      skills.forEach(skill => {
        const item = $(`<a class="dropdown-item" href="#">${skill.skillName_Level3}</a>`);
        item.data('value', skill.skillName_Level3);
        $dropdown.append(item);
      });
    }
  
    // Remove skill button
    $(document).on('click', '.remove-skill-btn', function() {
      $(this).closest('.feedback-group').remove();
    });
  
    // Close searchable dropdown when clicking outside
    $(document).on('click', function(event) {
      if (!$(event.target).closest('.searchable-dropdown').length) {
        $('.searchable-dropdown .dropdown-menu').removeClass('show');
      }
    });
  });
  