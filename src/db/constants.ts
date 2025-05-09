export const SORT_FIELDS = [
    { value: "firstName", label: "First Name" },
    { value: "lastName", label: "Last Name" },
    { value: "city", label: "City" },
    { value: "degree", label: "Degree" },
    { value: "yearsOfExperience", label: "Years of Experience" },
    // { value: "createdAt", label: "Created At" }, // Removed
];

// Placeholder for specialty options - this could be fetched or be a larger static list
export const SPECIALTY_OPTIONS = [
    { value: "", label: "All Specialties" },
    { value: "Trauma & PTSD", label: "Trauma & PTSD" },
    { value: "Personality disorders", label: "Personality disorders" }, // Note: Appears twice in user list, kept once.
    { value: "Personal growth", label: "Personal growth" },
    { value: "Substance use/abuse", label: "Substance use/abuse" },
    { value: "Pediatrics", label: "Pediatrics" },
    { value: "Women's issues (post-partum, infertility, family planning)", label: "Women's issues (post-partum, infertility, family planning)" },
    { value: "Chronic pain", label: "Chronic pain" },
    { value: "Eating disorders", label: "Eating disorders" },
    { value: "Coaching (leadership, career, academic and wellness)", label: "Coaching (leadership, career, academic and wellness)" },
    { value: "Sleep issues", label: "Sleep issues" },
    { value: "Diabetic Diet and nutrition", label: "Diabetic Diet and nutrition" },
    { value: "Obsessive-compulsive disorders", label: "Obsessive-compulsive disorders" },
    { value: "Neuropsychological evaluations & testing (ADHD testing)", label: "Neuropsychological evaluations & testing (ADHD testing)" },
    // "Personality disorders" was listed again, already included.
    { value: "Bipolar", label: "Bipolar" },
    { value: "LGBTQ", label: "LGBTQ" },
    { value: "Medication/Prescribing", label: "Medication/Prescribing" },
    { value: "Suicide History/Attempts", label: "Suicide History/Attempts" },
    { value: "General Mental Health (anxiety, depression, stress, grief, life transitions)", label: "General Mental Health (anxiety, depression, stress, grief, life transitions)" },
    { value: "Men's issues", label: "Men's issues" },
    { value: "Relationship Issues (family, friends, couple, etc)", label: "Relationship Issues (family, friends, couple, etc)" },
    // Assuming "all other conditions can be listed under 'all conditions'" meant the default "All Specialties" option.
];